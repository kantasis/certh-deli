
const Home: React.FC = () => {

   return (
      <div className="container">
         <header className="jumbotron">
            <div className="hero-content">
               <h3>Welcome to the ONCODIR Policy Analytics Dashboard (DELI)</h3>
               <p>A web-based intelligence tool that integrates and visualizes data for reporting purposes.</p>
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

               <div id="carouselExampleSlidesOnly" className="carousel slide" data-ride="carousel">
                  <div className="carousel-inner">
                     <div className="carousel-item active">
                        <img className="d-block w-100" src="..." alt="First slide"/>
                     </div>
                     <div className="carousel-item">
                        <img className="d-block w-100" src="..." alt="Second slide"/>
                     </div>
                     <div className="carousel-item">
                        <img className="d-block w-100" src="..." alt="Third slide"/>
                     </div>
                  </div>
               </div>


            </div>
         </header>
      </div>
   );
};

export default Home;
