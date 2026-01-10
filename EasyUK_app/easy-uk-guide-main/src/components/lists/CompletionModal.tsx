// import { PartyPopper } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { useLanguage } from '@/contexts/LanguageContext';

// interface CompletionModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   listTitle: string;
//   onShare: () => void;
//   onArchive: () => void;
// }

// export const CompletionModal = ({
//   open,
//   onOpenChange,
//   listTitle,
//   onShare,
//   onArchive,
// }: CompletionModalProps) => {
//   const { t } = useLanguage();

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="text-center">
//         <DialogHeader>
//           <div className="flex justify-center mb-4">
//             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
//               <PartyPopper className="h-8 w-8 text-primary" />
//             </div>
//           </div>
//           <DialogTitle className="text-xl">{t('lists.congratulations')}</DialogTitle>
//           <DialogDescription className="text-base">
//             {t('lists.completedMessage', { listName: listTitle })}
//           </DialogDescription>
//         </DialogHeader>
//         <DialogFooter className="flex-col gap-2 sm:flex-col">
//           <Button onClick={onShare} className="w-full">
//             {t('lists.share')}
//           </Button>
//           <Button variant="outline" onClick={onArchive} className="w-full">
//             {t('lists.archive')}
//           </Button>
//           <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
//             {t('lists.close')}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

import { Share2, Archive, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
  onArchive: () => void;
  listTitle: string;
}

export const CompletionModal = ({ 
  open, 
  onClose, 
  onShare, 
  onArchive,
  listTitle }: CompletionModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog 
    open={open} 
    onOpenChange={(isOpen) => {
       if (!isOpen) onClose();
       }}>

      <DialogContent className="sm:max-w-md">
        <DialogClose asChild>
            <X className="absolute right-4 top-4 h-4 w-4 cursor-pointer" />
          </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t('lists.congratulations')}
          </DialogTitle>
        </DialogHeader>
         
        <div className="text-center py-4">
          <div className="text-6xl mb-4">🎉</div>
        </div>
        <DialogDescription className="text-center text-base">
            {t('lists.completedMessage', { listName: listTitle })}
        </DialogDescription>

        <div className="flex flex-col gap-2">
          <Button onClick={onShare} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            {t('lists.share')}
          </Button>
          <Button onClick={onArchive} variant="outline" className="w-full">
            <Archive className="h-4 w-4 mr-2" />
            {t('lists.archive')}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" className="w-full">
              <X className="h-4 w-4 mr-2" />
              {t('lists.close')}  
            </Button>
            </DialogClose>

        </div>
      </DialogContent>
    </Dialog>
  );
};
