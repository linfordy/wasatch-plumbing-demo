interface GoogleMapProps {
  src: string;
  className?: string;
}

export function GoogleMap({ src, className = "" }: GoogleMapProps) {
  return (
    <div
      className={`bg-brand-dark border border-brand-darker rounded-xl overflow-hidden ${className}`}
    >
      <iframe
        src={src}
        className="w-full h-[350px] border-0 grayscale invert-[0.92] contrast-[0.9]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Wasatch Plumbing Co. location"
      />
    </div>
  );
}
