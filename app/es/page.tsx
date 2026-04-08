import { PostcardFlip } from '../components/PostcardFlip';

export default function SpanishPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 dark:bg-stone-900 px-4">
      <PostcardFlip backSrc="/2-es.jpeg" />
    </div>
  );
}
