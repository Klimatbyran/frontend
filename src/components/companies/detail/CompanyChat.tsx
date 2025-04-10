import { useState } from "react";
import { Send, X } from "lucide-react";
import { Text } from "@/components/ui/text";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
}

interface CompanyChatProps {
  companyName: string;
  companyId: string;
}

export function CompanyChat({ companyName, companyId }: CompanyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Intressant att se hur scope 3-utsläppen har minskat med 15% sedan förra året. Någon som vet vad det beror på?",
      author: {
        name: "Anna Karlsson",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
      },
      timestamp: new Date("2024-03-15T14:30:00"),
    },
    {
      id: "2",
      text: "De har implementerat nya riktlinjer för leverantörer och optimerat sin logistikkedja enligt årsredovisningen.",
      author: {
        name: "Erik Lindberg",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
      },
      timestamp: new Date("2024-03-15T14:35:00"),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [open, setOpen] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      author: {
        name: "Du",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop",
      },
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          Diskutera
          <div className="w-5 h-5 rounded-full bg-blue-5/30 text-blue-2 text-xs flex items-center justify-center">
            {messages.length}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-black-2 border-none p-0">
        <SheetHeader className="px-6 py-4 border-b border-black-1">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-light">
              Diskussion om {companyName}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-64px)]">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.author.name === "Du" && "flex-row-reverse",
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.author.avatar} />
                    <AvatarFallback>
                      {message.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "space-y-1 max-w-[80%]",
                      message.author.name === "Du" && "items-end",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Text variant="small" className="font-medium">
                        {message.author.name}
                      </Text>
                      <Text variant="small" className="text-grey">
                        {formatTimestamp(message.timestamp)}
                      </Text>
                    </div>
                    <div
                      className={cn(
                        "rounded-level-2 p-3",
                        message.author.name === "Du"
                          ? "bg-blue-5/30 text-blue-2"
                          : "bg-black-1",
                      )}
                    >
                      <Text>{message.text}</Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-black-1">
            <div className="flex gap-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Skriv ett meddelande..."
                className="min-h-[44px] bg-black-1 border-none resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="h-11 w-11 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
