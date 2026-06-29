import type { AccountSummary } from "@/app/lib/api";
import { avatarIconUrl } from "@/app/lib/avatar";

type UserBrowseCardProps = {
  user: AccountSummary;
};

export default function UserBrowseCard({ user }: UserBrowseCardProps) {
  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <div className="card-body items-center text-center gap-3">
        <div className="avatar">
          <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img
              src={avatarIconUrl(user.avatarCharSlug)}
              alt={user.username}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = "/icon.png";
              }}
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold">{user.username}</h3>
      </div>
    </div>
  );
}
