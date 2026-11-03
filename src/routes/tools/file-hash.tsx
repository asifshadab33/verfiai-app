import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import FileHash from '@/components/verifai/tools/FileHash';
export const Route = createFileRoute('/tools/file-hash')({
  component: () => (<ToolPage title="File Hash Verifier" description="Compute and verify SHA-256 hashes of files entirely in your browser via WebCrypto."><FileHash /></ToolPage>),
});
