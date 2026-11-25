// Shows a talent's photo or video (or nothing if it has no media)
export default function MediaView({ talent, className }) {
  if (!talent.image) return null;

  if (talent.mediaType === 'video') {
    return <video src={talent.image} className={className} controls muted playsInline />;
  }
  return <img src={talent.image} className={className} alt={talent.title} />;
}
