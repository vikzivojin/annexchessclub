import "./ChessboardMark.scss";

// A quiet, CSS-drawn checkerboard used as a decorative motif instead of a
// stock photo. Keeps the site's visual language tied to chess without
// leaning on generic imagery.
export function ChessboardMark() {
  const squares = Array.from({ length: 64 });

  return (
    <div className="chessboard-mark" aria-hidden="true">
      {squares.map((_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const isDark = (row + col) % 2 === 1;
        return <span key={index} className={isDark ? "is-dark" : undefined} />;
      })}
    </div>
  );
}
