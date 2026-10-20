import { UserPlus } from "lucide-react";

const statusColors = {
  active: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  inactive: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400",
};

export default function ActivityList({ recentMembers = [] }) {
  return (
    <div className="bg-white dark:bg-[#171717] dark:border dark:border-gray-800 rounded-2xl shadow-md dark:shadow-none p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Members</h3>
      </div>

      {recentMembers.length === 0 ? (
        <p className="text-slate-400 dark:text-gray-500 text-sm text-center py-8">No recent members.</p>
      ) : (
        <div className="space-y-4">
          {recentMembers.map((member) => {
            const status = String(member.status || "pending").trim().toLowerCase();
            return (
              <div key={member.member_id} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex-shrink-0">
                  <UserPlus size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-gray-200">
                    {member.first_name} {member.last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[status] || statusColors.pending}`}>
                      {member.status || "Pending"}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-gray-500">
                      {member.joined_date ? new Date(member.joined_date).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
