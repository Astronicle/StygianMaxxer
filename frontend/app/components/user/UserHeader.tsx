type UserHeaderProps = {
  username: string;
  charIcon: string;
};

export default function UserHeader({
  username,
  charIcon,
}: UserHeaderProps) {
  return (
    <div className="flex items-center gap-6">
      <div className="avatar">
        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img src={charIcon} alt={username} />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{username}</h1>
        <p className="text-sm opacity-70"></p>
      </div>
    </div>
  );
}
