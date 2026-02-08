type UserBrowseCardProps = {
  id: number;
  username: string;
  charIcon: string;
};

export default function UserBrowseCard({
  username,
  charIcon,
}: UserBrowseCardProps) {
  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <div className="card-body items-center text-center gap-3">
        <div className="avatar">
          <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={charIcon} alt={username} />
          </div>
        </div>

        <h3 className="text-lg font-semibold">{username}</h3>
      </div>
    </div>
  );
}
