"use client";

import { useState } from "react";

type MessageInputProps = {
  disabled?: boolean;
  onSend: (content: string) => Promise<void>;
};

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValue = value.trim();
    if (!nextValue) return;

    setValue("");
    await onSend(nextValue);
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <textarea
        className="min-h-32 rounded-[24px] border border-border bg-background px-4 py-4 text-sm outline-none ring-0 placeholder:text-foreground/45"
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask a question grounded in this PDF..."
        value={value}
      />
      <button
        className="self-end rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Send
      </button>
    </form>
  );
}
