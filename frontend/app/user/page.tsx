import { userMock } from "@/app/lib/mock/userBrowse";
import UserBrowseCard from "@/app/components/userBrowse/UserBrowseCard";
import Link from "next/link";

export default function UserBrowsePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="opacity-70">
          Browse all registered users
        </p>
      </div>

      {userMock.length === 0 ? (
        <div className="alert alert-info">
          No users found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {userMock.map((user) => (
            <Link
              key={user.id}
              href={`/user/${user.username}`}
            >
              <UserBrowseCard {...user} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
