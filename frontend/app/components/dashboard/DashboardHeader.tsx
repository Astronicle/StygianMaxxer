type DashboardHeaderProps = {
  username: string;
  charIcon: string;
};

export default function DashboardHeader({
  username,
  charIcon,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="avatar">
          <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={charIcon} alt={username} />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="opacity-70">Logged in as {username}</p>
        </div>
      </div>

      <button className="btn btn-primary">
        + Create Post
      </button>
    </div>
  );
}
