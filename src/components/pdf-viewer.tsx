import { Document, Page, pdfjs} from 'react-pdf';
import { useState, useRef, useCallback,useEffect } from 'react'
import testPdf from "../test.pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({initialPage = 5,file,book_id}) {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const { user, backendUrl } = useAuth();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(isMobile?0.8:2.8);
  const [rotation, setRotation] = useState(0);

  const containerRef = useRef(null);
  const pageRefs = useRef([]);
  const hasScrolledToInitial = useRef(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    pageRefs.current = Array(numPages).fill(null);
  }
  console.log("FILE",typeof file)
  // Once all page refs exist, jump to the initial page (no smooth
  // animation here — this is a "start here" jump, not a nav click).
  useEffect(() => {
    if (
      !hasScrolledToInitial.current &&
      numPages &&
      pageRefs.current[initialPage - 1]
    ) {
      pageRefs.current[initialPage - 1].scrollIntoView({ block: 'start' });
      setPageNumber(initialPage);
      hasScrolledToInitial.current = true;
    }
  }, [numPages, initialPage]);

  function scrollToPage(n) {
    const target = pageRefs.current[n - 1];
    if (target && containerRef.current) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPageNumber(n);
    }
  }

  function goToPrevPage() {
    scrollToPage(Math.max(pageNumber - 1, 1));
  }

  function goToNextPage() {
    scrollToPage(Math.min(pageNumber + 1, numPages ?? pageNumber));
  }

  function zoomIn() {
    setScale((prev) => Math.min(prev + 0.2, 3));
  }

  function zoomOut() {
    setScale((prev) => Math.max(prev - 0.2, 0.4));
  }

  function rotate() {
    setRotation((prev) => (prev + 90) % 360);
  }

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerTop = container.getBoundingClientRect().top;
    let closestPage = 1;
    let closestDistance = Infinity;

    pageRefs.current.forEach((el, idx) => {
      if (!el) return;
      const distance = Math.abs(el.getBoundingClientRect().top - containerTop);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = idx + 1;
      }
    });

    setPageNumber(closestPage);
  }, []);
 

  const pageNumberRef = useRef(pageNumber);
  useEffect(() => {
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);

  // Debounced save as user scrolls/reads
  useEffect(() => {
    if (!book_id) return;
    const base = backendUrl ;
    const readerId = user?.user_id

    const delayDebounceFn = setTimeout(() => {
      fetch(`${base}/save_reading_progress?reader_id=${readerId}&book_id=${book_id}&page_stopped_at=${pageNumber}`, {
        method: "POST",
      }).catch((err) => console.error("Failed to save progress:", err));
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [pageNumber, book_id, user?.id, backendUrl]);

  // Save on tab close, refresh, navigating away, or component unmount
  useEffect(() => {
    const saveProgress = () => {
      if (!book_id) return;
      const base = backendUrl ;
      const readerId = user?.id || "1dd309e3-31d0-4f53-b58a-f1d36e6a1dc4";
      const url = `${base}/save_reading_progress?reader_id=${readerId}&book_id=${book_id}&page_stopped_at=${pageNumberRef.current}`;
      navigator.sendBeacon(url);
    };

    window.addEventListener("pagehide", saveProgress);
    window.addEventListener("beforeunload", saveProgress);

    return () => {
      window.removeEventListener("pagehide", saveProgress);
      window.removeEventListener("beforeunload", saveProgress);
      saveProgress();
    };
  }, [book_id, user?.id, backendUrl]);

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {/* Toolbar */}
      <div className={`sticky ${isMobile ? 'mt-10' : 'mt-2'} top-2 z-10 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-sm`}>
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm tabular-nums min-w-[70px] text-center">
          {pageNumber} / {numPages ?? '–'}
        </span>

        <button
          onClick={goToNextPage}
          disabled={!numPages || pageNumber >= numPages}
          className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          onClick={zoomOut}
          disabled={scale <= 0.4}
          className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>

        <span className="text-sm tabular-nums min-w-[45px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={zoomIn}
          disabled={scale >= 3}
          className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button onClick={rotate} className="p-1.5 rounded hover:bg-muted" aria-label="Rotate">
          <RotateCw size={18} />
        </button>
      </div>

      {/* Scrollable document area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-h-[92vh] overflow-y-auto rounded-lg border border-border bg-muted/30"
      >
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <div className="flex flex-col items-center gap-4 p-4">
            {numPages &&
              Array.from({ length: numPages }, (_, idx) => (
                <div
                  key={idx}
                  ref={(el) => (pageRefs.current[idx] = el)}
                  className="shadow-lg border border-border rounded-lg overflow-hidden"
                >
                  <Page
                    pageNumber={idx + 1}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              ))}
          </div>
        </Document>
      </div>
    </div>
  );
}
