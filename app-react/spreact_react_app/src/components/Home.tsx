
import { Button, Dropdown } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import ExampleCarouselImage from 'components/ExampleCarouselImage';

const Home: React.FC = () => {

   const style = {
      image: {
         width: '100%',
         height: '100%',
         objectFit: 'cover', // Maintains aspect ratio, while covering the area
         padding: '2% 0%'
      }
   };

   const carouselImages_strLst = [
      "incidence.png",
      "lifestyle.png",
      "nutrition.png",
   ];

   return (
      <div className="container">
         <header className="jumbotron">
            <div className="hero-content">
               <br />
               <h3>Welcome to the ONCODIR Policy Analytics Dashboard (DELI)</h3>
               <p>Α web-based intelligent dashboard with descriptive and predictive analytics to inform evidence-based policy decisions on CRC prevention.</p>
               <br />

               {/* <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/nQolg4hVvBE?si=YcWJ5Tv2cniNZRYM"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
               >

               </iframe> */}
               <video width="560" height="315" controls poster="/src/assets/Oncodir photo for video.png">
                  <source src="/src/assets/Oncodir with voiceover - no music.mp4" type="video/mp4"/>
                     Your browser does not support the video tag.
               </video>

               {/* <Carousel>
                  {carouselImages_strLst.map((carouselImage_str, index_i)=>(
                     <Carousel.Item>
                        <img 
                           key={`image-${index_i}`} 
                           className="d-block w-100"
                           src={carouselImage_str}
                           alt={`Slide #${index_i}`}
                        />
                     </Carousel.Item>
                  ))}
               </Carousel> */}

            </div>
         </header>
      </div>
   );
};

export default Home;
