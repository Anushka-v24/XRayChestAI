export default function Loader() {
  return (
    <div className="flex gap-2 p-3">
      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce" />
      <div
        className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce"
        style={{ animationDelay: "0.15s" }}
      />
      <div
        className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce"
        style={{ animationDelay: "0.30s" }}
      />
    </div>
  );
}
