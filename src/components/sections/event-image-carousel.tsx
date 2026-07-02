"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const AUTO_SCROLL_INTERVAL_MS = 3000;

interface EventImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function EventImageCarousel({
  images,
  alt,
  className,
}: EventImageCarouselProps): React.ReactElement {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  const count = images.length;
  const hasMultiple = count > 1;

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: AUTO_SCROLL_INTERVAL_MS,
        stopOnInteraction: true,
      }),
    [],
  );

  const onSelect = useCallback((): void => {
    if (!api) return;
    setIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  if (count === 0) {
    return <></>;
  }

  return (
    <Carousel
      className={cn("relative h-full w-full", className)}
      opts={{ loop: hasMultiple }}
      plugins={hasMultiple ? [autoplayPlugin] : undefined}
      setApi={setApi}
    >
      <CarouselContent className="ml-0 h-full">
        {images.map((src, i) => (
          <CarouselItem key={src} className="pl-0">
            <img
              src={src}
              alt={count === 1 ? alt : `${alt} — image ${i + 1} of ${count}`}
              className="h-full w-full object-cover"
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-stone-900/60 text-white backdrop-blur-sm hover:bg-stone-900/80 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-stone-900/60 text-white backdrop-blur-sm hover:bg-stone-900/80 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "h-2 w-2 transition-colors",
                  i === index ? "bg-white" : "bg-white/40 hover:bg-white/70",
                )}
                onClick={() => api?.scrollTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </Carousel>
  );
}
