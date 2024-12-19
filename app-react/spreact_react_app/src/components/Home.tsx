
import { Button, Dropdown } from 'react-bootstrap'; 
import Carousel from 'react-bootstrap/Carousel';
import ExampleCarouselImage from 'components/ExampleCarouselImage';

const Home: React.FC = () => {

   const style = {
      image:{
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
               <h3>Welcome to the ONCODIR Policy Analytics Dashboard (DELI)</h3>
               <p>A web-based intelligence tool that integrates and visualizes data for reporting purposes.</p>
               <br/>

               <iframe 
                  width="560" 
                  height="315" 
                  src="https://www.youtube.com/embed/nQolg4hVvBE?si=YcWJ5Tv2cniNZRYM" 
                  title="YouTube video player" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerpolicy="strict-origin-when-cross-origin" 
                  allowfullscreen
               >

               </iframe>
               <Carousel>
                  {carouselImages_strLst.map((carouselImage_str, index_i)=>(
                     <Carousel.Item>
                        <img 
                           key={`image-${index_i}`} 
                           className="d-block w-100"
                           src={carouselImage_str}
                           alt={`Slide #${index_i}`}
                        />
                        {/* <Carousel.Caption>
                           <h3>First slide label</h3>
                           <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                        </Carousel.Caption> */}
                     </Carousel.Item>
                  ))}
               </Carousel>

            </div>
         </header>
      </div>
   );
};

export default Home;
