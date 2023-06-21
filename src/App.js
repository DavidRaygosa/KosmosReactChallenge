import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [error, setError] = useState({
    msg: '',
    active: false
  });

  /**
   * Create a new moveable component and add it to the array
   */
  const addMoveable = () => {
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        fit: handleFit(),
        imageUrl: handleImage() || ''
      },
    ]);
  };

  /**
   * Update drag movement
   * 
   * @param {number} id 
   * @param {object} newComponent 
   * @param {boolean} updateEnd 
   */
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  /**
   * Check if the resize is coming from the left handle
   * 
   * @param {number} index 
   * @param {object} e 
   */
  const handleResizeStart = (index, e) => {
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  /**
   * Make fetch request to get and set images
   */
  const getImages = async() => {
    //
    setLoadingImages(true);
    setError({
      msg: '',
      active: false
    });
    try{
      const FetchImagesPromise = await fetch('https://jsonplaceholder.typicode.com/photos');
      const Images = await FetchImagesPromise.json();
      setImages(Images);
    }catch(e){
      setError({
        msg: e.toString() || 'Error at loading images',
        active: true
      });
    }
    setLoadingImages(false);
  }

  /**
   * Get random fit
   * 
   * @returns {string} Fit
   */
  const handleFit = () => {
    const Fits = ['auto', 'cover', 'contain', 'initial', 'inherit', 'revert', 'unset'];
    return Fits[Math.floor(Math.random() * Fits.length)];
  }

  /**
   * Get random and unique images
   * 
   * @return {string} Image url
   */
  const handleImage = () => {
    //
    let looping = true;
    let imageUrl = '';
    while(looping && images.length > 0){
      const Image = images[Math.floor(Math.random() * images.length)];
      if(!moveableComponents.find(x => x.imageUrl == Image.url)){
        looping = false;
        imageUrl = Image.url;
      }
    }
    return imageUrl;
  }

  /**
   * Delete component by id
   * 
   * @param {number} id
   */
  const onDeleteComponent = (id) => {
    //
    setMoveableComponents(moveableComponents.filter(x => x.id !== id));
  }

  /**
   * GET IMAGES FROM FETCH REQUEST WHEN INIT
   */
  useEffect(() => {
    getImages();
  },[]);

  /**
   * Render app
   */
  return (
    <main style={{ height: "100vh", width: "100vw", position: 'relative' }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            onDeleteComponent={onDeleteComponent}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

/**
 * Create react-moveable component
 * 
 * @param {object} props
 * @returns {string} Component
 */
const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  fit,
  imageUrl,
  onDeleteComponent
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
    fit,
    imageUrl
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  /**
   * On resize component
   * 
   * @param {object} e 
   */
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      fit,
      imageUrl
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  /**
   * On finish resize component
   * 
   * @param {object} e 
   */
  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        fit,
        imageUrl
      },
      true
    );
  };

  /**
   * Build and render component
   */
  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          boxSizing: 'border-box',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: fit,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center"
        }}
        onClick={() => setSelected(id)}
      >
        <div style={{ width:'100%', display:'flex', justifyContent: "end", paddingTop:'4px' }}>
          <button onClick={(e) => onDeleteComponent(id)} style={{ borderRadius: '5px', border: 'none', backgroundColor:'#dc3545', color:'white', cursor:'pointer' }}>
            X
          </button>
        </div>
        
        <Moveable
          target={isSelected && ref.current}
          resizable
          draggable
          onDrag={(e) => {
            updateMoveable(id, {
              top: e.top,
              left: e.left,
              width,
              height,
              color,
              fit,
              imageUrl
            });
          }}
          bounds={{
            top: 0,
            left: 0,
            right: parentBounds?.width,
            bottom: parentBounds?.height,
          }}
          onResize={onResize}
          //onResizeEnd={onResizeEnd} //! ACCOMULATE CURRENT POSITION TO END POSITION | PREVENT STEP 3 ERROR
          keepRatio={false}
          throttleResize={1}
          renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
          edge={false}
          zoom={1}
          origin={false}
          padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
          snappable={true}
        />
      </div>
    </>
  );
}