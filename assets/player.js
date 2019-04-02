
  
  
    
      seekBar.addEventListener("change", function() {
        // Calculate the new time
        var time = video.duration * (seekBar.value / 100);
      
        // Update the video time
        video.currentTime = time;
      });
      video.addEventListener("timeupdate", function() {
        // Calculate the slider value
        var value = (100 / video.duration) * video.currentTime;
      
        // Update the slider value
        seekBar.value = value;
      });

      seekBar.addEventListener("mousedown", function() {
        video.pause();
      });
      
      // Play the video when the slider handle is dropped
      seekBar.addEventListener("mouseup", function() {
        video.play();
      });
      volumeBar.addEventListener("change", function() {
        // Update the video volume
        video.volume = volumeBar.value;
      });