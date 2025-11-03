import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AdPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdPopup({ isOpen, onClose }: AdPopupProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 bg-black border-primary/20 overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-card to-card/80 flex items-center justify-center">
          {countdown > 0 ? (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
              Anúncio ({countdown}s)
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10 bg-black/60 backdrop-blur-sm hover:bg-black/80 rounded-full transition-all duration-200"
              onClick={onClose}
            >
              <X className="w-6 h-6 text-white" />
            </Button>
          )}
          
          <div className="text-center space-y-6 p-8">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30">
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Atenção: Este Player Contém Anúncios
              </h3>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-lg text-muted-foreground">
                Este player pode exibir anúncios durante a reprodução.
              </p>
            </div>

            {countdown > 0 && (
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Fechando em {countdown}s...
                </p>
                <div className="h-2 w-full bg-card-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
