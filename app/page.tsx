'use client';

// AI SDK UI Imports - Framework-agnostic hooks for building chat and generative UI
// Reference: https://ai-sdk.dev/docs/ai-sdk-ui/overview
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Actions,
  Action,
} from '@/components/ai-elements/actions';
import { Fragment, useState } from 'react';
// AI SDK React Hook - Core hook for chat functionality
// Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import { CopyIcon, RefreshCcwIcon, BrainIcon } from 'lucide-react';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { weatherToolDescriptions } from '@/tools/weather-tool';
// Import shared configuration
import { models, DEFAULT_MODEL } from '@/lib/config';

const ChatBotDemo = () => {
  // Local state for input management and model selection
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [thinkMode, setThinkMode] = useState(false);

  // AI SDK useChat hook - provides core chat functionality
  // Returns: messages (conversation history), sendMessage (send new messages),
  // status (connection state), regenerate (retry last message)
  // Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
  const { messages, sendMessage, status, regenerate } = useChat();

  // Handle message submission - integrates with AI SDK useChat hook
  // The message flows: UI -> useChat -> API route -> AI provider -> streaming response
  // Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#message-handling
  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim();

    if (!text) {
      return;
    }

    // sendMessage from useChat hook - sends message to API route
    // Body parameter allows passing additional data (like model selection) to the backend
    // Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#sendmessage
    sendMessage(
      {
        text, // Message content for AI SDK UI format
      },
      {
        body: {
          model, // Custom data passed to API route (model selection)
          think: thinkMode, // Enable/disable reasoning mode
        },
      },
    );
    setInput(''); // Clear input after sending
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        {/* Conversation component - AI SDK UI wrapper for chat messages */}
        {/* Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#conversation-management */}
        <Conversation className="h-full">
          <ConversationContent>
            {/* Render messages from useChat hook - each message has parts (text, reasoning, sources) */}
            {/* Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#message-rendering */}
            {messages.map((message) => (
              <div key={message.id}>
                {/* Conditional rendering for sources - AI SDK supports multiple content types per message */}
                {/* Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#message-parts */}
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {/* Map through source parts - each part represents different content type */}
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                      <SourcesContent key={`${message.id}-${i}`}>
                        <Source
                          key={`${message.id}-${i}`}
                          href={part.url}
                          title={part.url}
                        />
                      </SourcesContent>
                    ))}
                  </Sources>
                )}
                {/* Map through all message parts - AI SDK supports multiple content types */}
                {/* Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#message-parts */}
                {/* Sort parts to ensure reasoning appears before text */}
                {message.parts
                  .sort((a, b) => {
                    // Reasoning parts should come first
                    if (a.type === 'reasoning' && b.type !== 'reasoning') return -1;
                    if (a.type !== 'reasoning' && b.type === 'reasoning') return 1;
                    return 0;
                  })
                  .map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      // Skip rendering empty text parts (e.g., when only tools are called)
                      if (!part.text.trim()) {
                        return null;
                      }
                      
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          {/* Message component - renders individual chat messages */}
                          <Message from={message.role}>
                            <MessageContent>
                              {message.role === 'assistant' ? (
                                // Response component - formats AI assistant responses
                                <Response>
                                  {part.text}
                                </Response>
                              ) : (
                                // User messages - plain text formatting
                                <p className="whitespace-pre-wrap">{part.text}</p>
                              )}
                            </MessageContent>
                          </Message>
                          {/* Actions for assistant messages - regenerate and copy functionality */}
                          {/* Only show on last assistant message for context */}
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <Actions className="mt-2">
                              <Action
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      );
                    case 'reasoning':
                      return (
                        // Reasoning component - displays AI's chain of thought
                        // isStreaming prop shows loading state for real-time updates
                        // Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#reasoning-display
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full mb-1"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      // Handle tool parts - AI SDK creates parts with type 'tool-{toolName}'
                      // Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#tool-parts
                      if (part.type.startsWith('tool-')) {
                        // Type assertion for tool parts with proper typing
                        const toolPart = part as any;
                        
                        // Get custom descriptions based on tool type
                        const getCustomDescriptions = (toolType: string) => {
                          switch (toolType) {
                            case 'tool-weather':
                              return weatherToolDescriptions;
                            default:
                              return undefined;
                          }
                        };

                        return (
                          <Tool
                            key={`${message.id}-${i}`}
                            defaultOpen={
                              toolPart.state === 'output-available' ||
                              toolPart.state === 'output-error'
                            }
                          >
                            <ToolHeader
                              type={toolPart.type}
                              state={toolPart.state}
                              customDescriptions={getCustomDescriptions(toolPart.type)}
                            />
                            <ToolContent>
                              <ToolInput input={toolPart.input} />
                              <ToolOutput
                                output={
                                  toolPart.output ? (
                                    <Response>
                                      {typeof toolPart.output === 'string'
                                        ? toolPart.output
                                        : JSON.stringify(toolPart.output, null, 2)}
                                    </Response>
                                  ) : undefined
                                }
                                errorText={toolPart.errorText}
                              />
                            </ToolContent>
                          </Tool>
                        );
                      }
                      return null;
                  }
                })}
              </div>
            ))}
            {/* Loader component - shows when message is submitted but not yet streaming */}
            {/* AI SDK status states: idle, submitted, streaming, ready, error */}
            {/* Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#loading-states */}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          {/* Auto-scroll button for conversation - scrolls to bottom on new messages */}
          <ConversationScrollButton />
        </Conversation>

        {/* PromptInput - AI SDK UI component for message input and submission */}
        {/* Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#input-handling */}
        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            {/* Textarea for message input - controlled component with local state */}
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              {/* Think mode toggle - enables reasoning/chain-of-thought */}
              <button
                onClick={() => setThinkMode(!thinkMode)}
                className={`p-2 rounded-md transition-colors ${
                  thinkMode
                    ? 'bg-pink-500/20 text-pink-600 hover:bg-pink-500/30'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={thinkMode ? 'Thinking mode enabled' : 'Thinking mode disabled'}
              >
                <BrainIcon className="size-4" />
              </button>
              {/* Model selection dropdown - allows switching between AI models */}
              {/* Model value is passed via body parameter to API route */}
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {/* Dynamic model options from configuration array */}
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.value} value={model.value}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            {/* Submit button - disabled state managed by input content and connection status */}
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;