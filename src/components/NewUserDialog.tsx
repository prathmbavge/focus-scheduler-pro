import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useWebSocket from '@/hooks/useWebSocket';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const NewUserDialog: React.FC<NewUserDialogProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const { requestDataReset, isConnected } = useWebSocket({
    onConnect: () => {
      setConnecting(false);
    },
    onError: () => {
      setConnecting(false);
    }
  });

  // Set a timeout for connection attempts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isConnected) {
        setConnecting(false);
      }
    }, 5000); // Give it 5 seconds to connect
    
    return () => clearTimeout(timer);
  }, [isConnected]);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await requestDataReset();
      toast.success('Application initialized for new user');
      onComplete();
    } catch (error) {
      console.error('Error initializing for new user:', error);
      toast.error('Failed to initialize application');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info('Using existing data');
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Focus Scheduler Pro!</DialogTitle>
          <DialogDescription>
            Would you like to start with a fresh setup? This will reset the application 
            data to default settings, giving you a clean slate.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose <strong>Start Fresh</strong> to begin with a clean slate, or 
            <strong> Continue with Existing Data</strong> if you want to use the current setup.
          </p>
          
          {connecting && (
            <div className="flex items-center justify-center p-2 mb-4 bg-amber-50 text-amber-800 rounded-md">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">Connecting to server...</span>
            </div>
          )}
          
          {!connecting && !isConnected && (
            <div className="p-2 mb-4 bg-amber-50 text-amber-800 rounded-md">
              <p className="text-xs">Unable to connect to the server. You can still continue with existing data.</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            onClick={handleSkip}
            disabled={loading}
            className="sm:mr-auto"
          >
            Continue with Existing Data
          </Button>
          
          <Button 
            onClick={handleContinue} 
            disabled={loading || (!isConnected && !connecting)}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              'Start Fresh'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewUserDialog; 