import postgres from "postgres";
import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";

// Requires a privileged disposable database connection, not Cloud's restricted schema connection.
const connection = process.env["LIBRARY_QA_PRIVILEGED_DATABASE_URL"];
describe.skipIf(!connection)("live library protections (rolled-back fixtures)", () => {
  async function check(run: (sql: postgres.TransactionSql) => Promise<void>) {
    if (!connection) throw new Error("Database test access unavailable");
    const sql = postgres(connection, { max: 1 });
    let passed = false;
    try {
      await sql.begin(async tx => { await run(tx); passed = true; throw new Error("ROLLBACK_QA_FIXTURES"); });
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "ROLLBACK_QA_FIXTURES") throw error;
    } finally { await sql.end(); }
    expect(passed).toBe(true);
  }
  async function fixture(sql: postgres.TransactionSql) {
    const users = await sql`select id from auth.users order by id limit 2`;
    const first = users[0]?.["id"] as string | undefined;
    const second = users[1]?.["id"] as string | undefined;
    if (!first || !second) throw new Error("Two accounts required for isolation test");
    const id = randomUUID();
    await sql`insert into public.knowledge_resources(id,slug,title,publisher,original_url,rights_status,published,full_content) values (${id},${`qa-${id}`},'Synthetic QA fixture','QA publisher','https://example.org','LINK_ONLY',true,'PRIVATE_QA_CONTENT')`;
    return { id, first, second };
  }
  async function asUser(sql: postgres.TransactionSql, user: string) {
    await sql`select set_config('request.jwt.claim.sub',${user},true)`;
    await sql`set local role authenticated`;
  }
  it("denies anonymous full text, histories and both download signatures", async () => check(async sql => {
    await sql`set local role anon`;
    expect((await sql`select has_column_privilege(current_user,'public.knowledge_resources','full_content','SELECT') ok`)[0]?.["ok"]).toBe(false);
    for (const table of ["resource_issues", "resource_downloads"]) {
      await expect(sql.savepoint(tx => tx.unsafe(`select * from public.${table}`))).rejects.toMatchObject({ code: "42501" });
    }
    await expect(sql.savepoint(tx => tx`select full_content from public.knowledge_resources`)).rejects.toMatchObject({ code: "42501" });
    await expect(sql.savepoint(tx => tx`select * from public.claim_library_download(${randomUUID()}::uuid)`)).rejects.toMatchObject({ code: "42501" });
    await expect(sql.savepoint(tx => tx`select * from public.claim_library_download(${randomUUID()}::uuid,'live')`)).rejects.toMatchObject({ code: "42501" });
  }));
  it("uses pending-review defaults and hides unpublished/revoked metadata and references", async () => check(async sql => {
    const { id } = await fixture(sql);
    const pending = randomUUID();
    await sql`insert into public.knowledge_resources(id,slug,title,publisher,original_url) values (${pending},${`qa-${pending}`},'Pending QA','QA','https://example.org')`;
    expect((await sql`select rights_status,published from public.knowledge_resources where id=${pending}`)[0]).toMatchObject({ rights_status: "PENDING_REVIEW", published: false });
    await sql`insert into public.resource_sources(resource_id,title,url,publisher) values (${id},'QA source','https://example.org','QA')`;
    await sql`set local role anon`;
    expect(await sql`select id from public.knowledge_resources where id=${pending}`).toHaveLength(0);
    expect(await sql`select id from public.knowledge_resources where id=${id}`).toHaveLength(1);
    await sql`reset role`;
    await sql`update public.knowledge_resources set published=false,rights_status='TAKEDOWN_REVIEW' where id=${id}`;
    await sql`set local role anon`;
    expect(await sql`select id from public.knowledge_resources where id=${id}`).toHaveLength(0);
    expect(await sql`select id from public.resource_sources where resource_id=${id}`).toHaveLength(0);
  }));
  it("isolates issue and download rows between two users and prevents forged ownership", async () => check(async sql => {
    const { id, first, second } = await fixture(sql);
    const sub = randomUUID();
    await sql`insert into public.subscriptions(id,user_id,paddle_subscription_id,paddle_customer_id,product_id,price_id,environment) values (${sub},${first},${`qa-${sub}`},'qa','analyst_plan','qa','sandbox')`;
    await sql`insert into public.resource_downloads(resource_id,user_id,subscription_id,period_start,period_end,file_version) values (${id},${first},${sub},now(),now()+interval '1 month','1')`;
    await asUser(sql, first);
    await sql`insert into public.resource_issues(resource_id,user_id,issue_type,message) values (${id},${first},'OTHER','Synthetic issue test')`;
    expect(await sql`select id from public.resource_issues where resource_id=${id}`).toHaveLength(1);
    expect(await sql`select id from public.resource_downloads where resource_id=${id}`).toHaveLength(1);
    await sql`reset role`;
    await asUser(sql, second);
    expect(await sql`select id from public.resource_issues where resource_id=${id}`).toHaveLength(0);
    expect(await sql`select id from public.resource_downloads where resource_id=${id}`).toHaveLength(0);
    await expect(sql.savepoint(tx => tx`insert into public.resource_issues(resource_id,user_id,issue_type,message) values (${id},${first},'OTHER','Forged issue owner')`)).rejects.toMatchObject({ code: "42501" });
    await expect(sql.savepoint(tx => tx`select * from public.claim_library_download(${id}::uuid)`)).rejects.toMatchObject({ code: "42501" });
    await expect(sql.savepoint(tx => tx`select * from public.claim_library_download(${id}::uuid,'sandbox')`)).rejects.toMatchObject({ code: "42501" });
  }));
  it("accepts five reports per rolling hour, denies the sixth, validates text and rejects hidden targets", async () => check(async sql => {
    const { id, first } = await fixture(sql);
    // Avoid counting existing legitimate reports; the entire operation is rolled back.
    await sql`update public.resource_issues set created_at=now()-interval '2 hours' where user_id=${first}`;
    await asUser(sql, first);
    await expect(sql.savepoint(tx => tx`insert into public.resource_issues(resource_id,user_id,issue_type,message) values (${id},${first},'OTHER','          ')`)).rejects.toMatchObject({ code: "22023" });
    for (let n=0;n<5;n++) await sql`insert into public.resource_issues(resource_id,user_id,issue_type,message,created_at) values (${id},${first},'OTHER','Synthetic bounded report',now()-interval '1 year')`;
    expect(await sql`select id from public.resource_issues where resource_id=${id} and created_at>now()-interval '1 hour'`).toHaveLength(5);
    await expect(sql.savepoint(tx => tx`insert into public.resource_issues(resource_id,user_id,issue_type,message) values (${id},${first},'OTHER','Synthetic sixth report')`)).rejects.toMatchObject({ code: "P0001" });
    await sql`reset role`;
    await sql`update public.resource_issues set created_at=now()-interval '2 hours' where resource_id=${id}`;
    await sql`update public.knowledge_resources set published=false where id=${id}`;
    await asUser(sql, first);
    await expect(sql.savepoint(tx => tx`insert into public.resource_issues(resource_id,user_id,issue_type,message) values (${id},${first},'OTHER','Synthetic hidden report')`)).rejects.toMatchObject({ code: "22023" });
  }));
});