import type { ChatMessage } from "@/types/chat";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
};

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (!messages.length) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-[24px] bg-background p-8 text-center text-sm leading-6 text-foreground/65">
        Start with questions like “What is the core contribution?” or “Summarize section 3.”
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[24px] bg-background p-4">
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={message.role === "user" ? "ml-auto max-w-[85%]" : "max-w-[85%]"}
        >
          <div
            className={
              message.role === "user"
                ? "rounded-3xl bg-accent px-4 py-3 text-sm leading-6 text-white"
                : "rounded-3xl bg-white px-4 py-3 text-sm leading-6 text-foreground shadow-sm"
            }
          >
            {message.content}
          </div>
        </div>
      ))}
      {isLoading ? <p className="text-sm text-foreground/60">Generating answer...</p> : null}
    </div>
  );
}
