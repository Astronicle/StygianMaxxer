type VideoEmbedProps = {
  url: string;
};

export default function VideoEmbed({ url }: VideoEmbedProps) {
  const embedUrl = url.replace("youtu.be/", "www.youtube.com/embed/");

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
      />
    </div>
  );
}
