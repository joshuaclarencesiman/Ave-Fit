import { UserPlus } from "lucide-react";

const statusColors = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  inactive: "bg-slate-100 text-slate-500",
};

export default function ActivityList({ recentMembers = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Recent Members</h3>
      </div>

      {recentMembers.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">No recent members.</p>
      ) : (
        <div className="space-y-4">
          {recentMembers.map((member) => (
            <div key={member.member_id} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                <UserPlus size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">
                  {member.first_name} {member.last_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[member.status] || statusColors.inactive}`}>
                    {member.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {member.joined_date ? new Date(member.joined_date).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}