export interface FoiData { country: string; agency: string; subject: string; details: string; requesterName: string; }
export function generateFoiLetter(data: FoiData): string {
  return `To: ${data.agency || '[Agency Name]'}\nSubject: Freedom of Information Request - ${data.subject || '[Subject]'}\n\nDear Records Officer,\n\nUnder the ${data.country || '[Country]'} Freedom of Information laws, I am requesting access to records regarding:\n\n${data.details || '[Describe the specific records you are requesting]'}\n\nPlease provide these records in electronic format. If any portion of this request is denied, please provide a written explanation citing the specific legal exemption.\n\nThank you,\n${data.requesterName || '[Your Name]'}`;
}
