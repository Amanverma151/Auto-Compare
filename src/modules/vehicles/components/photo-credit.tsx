import type { PhotoCreditInfo } from "../types";

/** Attribution line required by the photo's Creative Commons licence. */
export function PhotoCredit({ credit, className }: { credit: PhotoCreditInfo; className?: string }) {
  return (
    <p className={className ?? "text-[11px] text-muted-foreground"}>
      Representative photo; trim and colour may differ.{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
        Photo: {credit.author}
      </a>
      {", "}
      {credit.licenseUrl ? (
        <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline-offset-2 hover:underline">
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
      , via Wikimedia Commons
    </p>
  );
}
