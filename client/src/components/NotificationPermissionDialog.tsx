import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/use-push-notifications';

const NOTIFICATION_PROMPT_SHOWN_KEY = 'taverna_notification_prompt_shown';

export function NotificationPermissionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { permission, isSupported, requestPermission } = usePushNotifications();

  useEffect(() => {
    const promptShown = localStorage.getItem(NOTIFICATION_PROMPT_SHOWN_KEY);
    
    if (isSupported && permission === 'default' && !promptShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleAllow = async () => {
    const granted = await requestPermission();
    localStorage.setItem(NOTIFICATION_PROMPT_SHOWN_KEY, 'true');
    setIsOpen(false);
    
    if (granted) {
      console.log('Notificações ativadas com sucesso!');
    }
  };

  const handleDeny = () => {
    localStorage.setItem(NOTIFICATION_PROMPT_SHOWN_KEY, 'true');
    setIsOpen(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-card/95 border-primary/20">
        <DialogHeader>
          <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Ativar Notificações
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Receba alertas quando novos filmes e séries forem adicionados à Taverna Stream.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleAllow}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            Permitir Notificações
          </Button>
          <Button
            onClick={handleDeny}
            variant="ghost"
            className="w-full"
          >
            Agora Não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
