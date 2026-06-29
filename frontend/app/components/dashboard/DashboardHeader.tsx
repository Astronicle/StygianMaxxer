type DashboardHeaderProps = {
  username: string;
  charIcon: string;
  onAvatarClick: () => void;
};

import Link from "next/link";

export default function DashboardHeader({
  username,
  charIcon,
  onAvatarClick,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onAvatarClick}
          className="avatar group relative cursor-pointer"
          title="Change avatar"
        >
          <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={charIcon} alt={username} />
          </div>
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <span className="text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100">
              Change
            </span>
          </div>
        </button>

        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="opacity-70">Logged in as {username}</p>
        </div>
      </div>

      <Link href="/post/create" className="btn btn-primary">
        <button className="btn btn-primary">
          + Create Post
        </button>
      </Link>
    </div>
  );
}
