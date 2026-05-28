export interface CommentSourceBlockProps {
  comment: string;
  source: string;
  onCommentChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  commentPlaceholder?: string;
  sourcePlaceholder?: string;
  /** Default "mt-6". Use "mt-10" for second block in details tab. */
  wrapperClassName?: string;
}

export function CommentSourceBlock({
  comment,
  source,
  onCommentChange,
  onSourceChange,
  commentPlaceholder = "Comment",
  sourcePlaceholder = "Source URL",
  wrapperClassName = "mt-6",
}: CommentSourceBlockProps) {
  return (
    <div className={`w-full ps-4 pe-2 ${wrapperClassName}`}>
      <textarea
        className="ms-2 w-full p-2 border-gray-300 rounded text-white bg-black-1"
        rows={4}
        placeholder={commentPlaceholder}
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
      />
      <input
        type="text"
        className="ms-2 mt-2 w-full p-2 rounded text-white bg-black-1"
        placeholder={sourcePlaceholder}
        value={source}
        onChange={(e) => onSourceChange(e.target.value)}
      />
    </div>
  );
}
