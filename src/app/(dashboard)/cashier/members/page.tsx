import { getMembers } from "@/app/actions/members";
import { MembersClient } from "./members-client";

export default async function MembersPage() {
  const { data } = await getMembers();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Database Member (Loyalty)</h1>
      <p className="text-gray-400 mb-6">Kelola kartu member pelanggan dan jumlah stempel/poin mereka.</p>
      
      <MembersClient initialMembers={data || []} />
    </div>
  );
}
