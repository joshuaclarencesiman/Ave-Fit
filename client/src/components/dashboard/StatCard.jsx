export default function StatCard({
  title,
  value,
  icon,
  color = "bg-orange-500",
  trend,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2 text-slate-800">{value}</h2>
          {trend && (
            <p className="text-xs text-green-500 mt-1 font-medium">{trend}</p>
          )}
        </div>
        <div className={`${color} p-4 rounded-xl text-white`}>{icon}</div>
      </div>
    </div>
  );
}