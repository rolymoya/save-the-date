import { FridgeScene } from '../components/FridgeScene';
import { FridgePhoto } from '../components/FridgePhoto';
import { PostcardFlip } from '../components/PostcardFlip';

export default function SpanishPage() {
  return (
    <FridgeScene>
      <PostcardFlip
        id="postcard"
        src="/1.png"
        backSrc="/2-es.jpeg"
        position={{ x: 0.75, y: 0.22 }}
      />
      <FridgePhoto
        id="chicago"
        src="/chicago.png"
        alt="Chicago"
        position={{ x: 0.3, y: 0.2 }}
        rotation={4}
        aspectRatio="512 / 347"
      />
      <FridgePhoto
        id="miami"
        src="/miami.jpg"
        alt="Miami"
        position={{ x: 0.25, y: 0.45 }}
        rotation={-6}
        aspectRatio="3809 / 2633"
      />
      <FridgePhoto
        id="tampa"
        src="/tampa.jpg"
        alt="Tampa"
        position={{ x: 0.7, y: 0.5 }}
        rotation={3}
        aspectRatio="1200 / 932"
      />
      <FridgePhoto
        id="dscf1204"
        src="/DSCF1204.jpg"
        alt="Photo"
        position={{ x: 0.45, y: 0.7 }}
        rotation={-4}
        aspectRatio="7728 / 5152"
      />
    </FridgeScene>
  );
}
