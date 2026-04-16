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
        position={{ x: 0.25, y: 0.20 }}
      />
        <FridgePhoto
            id="chicago"
            src="/chicago.png"
            alt="Chicago"
            position={{ x: 0.75, y: 0.1 }}
            rotation={-2}
            aspectRatio="512 / 347"
        />
        <FridgePhoto
            id="dscf1204"
            src="/DSCF1204.jpg"
            alt="Photo"
            position={{ x: 0.75, y: 0.40 }}
            rotation={2}
            aspectRatio="7728 / 5152"
        />
        <FridgePhoto
            id={"roly+maria"}
            src={"/party.jpeg"}
            alt={"roly+maria"}
            rotation={-1}
            position={{ x: 0.67, y: 0.20 }}
        />
        <FridgePhoto
            id={"maria+roly"}
            src={"/barristers.jpeg"}
            alt={"maria+roly"}
            rotation={-3.5}
            position={{ x: 0.85, y: 0.28 }}
        />
        <FridgePhoto
            id="miami"
            src="/miami.jpg"
            alt="Miami"
            position={{ x: 0.66, y: 0.30 }}
            rotation={5.5}
            aspectRatio="3809 / 2633"
        />
        {/*<FridgePhoto*/}
        {/*    id="tampa"*/}
        {/*    src="/tampa 2.jpg"*/}
        {/*    alt="Tampa"*/}
        {/*    position={{ x: 0.75, y: 0.35 }}*/}
        {/*    rotation={3}*/}
        {/*    aspectRatio="1170 / 765"*/}
        {/*/>*/}
    </FridgeScene>
  );
}
