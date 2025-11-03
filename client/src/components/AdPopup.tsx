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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Apoie a Taverna Stream
              </h3>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-muted-foreground">
                Nosso conteúdo é gratuito graças ao suporte de anúncios. 
                Agradecemos sua compreensão!
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-card-border">
                  <div className="text-primary font-bold text-lg">100%</div>
                  <div className="text-xs text-muted-foreground">Gratuito</div>
                </div>
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-card-border">
                  <div className="text-primary font-bold text-lg">HD</div>
                  <div className="text-xs text-muted-foreground">Qualidade</div>
                </div>
              </div>
            </div>

            {countdown > 0 && (
              <div className="pt-4">
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
