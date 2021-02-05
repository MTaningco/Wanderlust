//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import NewLandmarkTab from './NewLandmarkTab';
import NewPathTab from './NewPathTab';

function OtherFeatureTab({value, index, drawerValue, invalidateAuth, setLandmarks, setTempLandmark, setPaths, newPathHandler}) {
  return (
    <div hidden={value !== index}>
      <NewLandmarkTab setLandmarks={setLandmarks} 
        value={drawerValue} 
        index={0} 
        setTempLandmark={setTempLandmark} 
        invalidateAuth={invalidateAuth}/>
      <NewPathTab setPaths={setPaths} 
        value={drawerValue} 
        index={2} 
        setTempPath={newPathHandler} 
        invalidateAuth={invalidateAuth}/>
    </div>
  );
}
 
export default OtherFeatureTab;