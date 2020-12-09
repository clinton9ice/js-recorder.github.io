$(document).ready(function () {
    let body = $("body"),
    list_board = body.find("[data-list]"),
    list_parent = body.find("[data-list]"),
        error = body.find("[data-err]");

    function stopProps(e) {
    e.on("click", function (event) {
        event.stopPropagation()
      })
    }

    let theme = () => {
    let theme_btn = body.find("[data-theme]");
    theme_btn.on("click", function () {
      if (body.hasClass("dark")) {
        body.removeClass("dark");
        theme_btn.attr("class", "far fa-lightbulb");
      } else {
        body.addClass("dark");
        theme_btn.attr("class", "fa fa-lightbulb");
      }
    });
  }
  let Err = (msg) =>{
      error.addClass("triggered")
      error.find(".errorStatus").html(msg)
      setTimeout(() =>{ error.removeClass("triggered")}, 3000)
  }
    let footer_section = () => {
      let listButton = body.find("[data-list-button]"), record_button;
      stopProps(list_parent);

      //record-button
        record_button = body.find("[data-record-button]");

        // set up basic variables for app
         const record = body.find("[data-record-button]");
         const stop = body.find('[data-stop]')
        // disable stop button while not recording
        stop.disabled = true;
         //Set Time
        let min = body.find("[data-min]"),
            sec = body.find("[data-secs]"),
            hr = body.find("[data-hour]")
        let index = 0, min_count = min.html()+1, hr_count = hr.html()+1;

            const timeFrame = () =>{
                if (index === 60){
                    index = 0;
                    min.html("0" + min_count++)
                    if (min_count > 9) min.html(min_count)
                }
                else if (min_count == 60){
                    min_count = 0;
                    hr.html("0" + hr_count++)
                    if (hr_count > 9) hr.html(hr_count)
                }
                else{
                    index++
                }
                sec.html(parseInt(index))
            }

        //main block for doing the audio recording
        if (navigator.mediaDevices.getUserMedia) {
            const constraints = { audio: true };
            let chunks = [], time;

            let onSuccess = function(stream) {
                const mediaRecorder = new MediaRecorder(stream);

                record.on("click", function(e) {
                   if (e.target.id === "record"){
                       record_button.find("i").attr({
                           "class": "fa fa-pause",
                           "id": "pause"
                       });
                       record_button.css("backgroundColor", "#6ff15473");

                       if (mediaRecorder.state === "inactive"){
                           mediaRecorder.start();
                           time = setInterval(timeFrame, 1000);
                           mediaRecorder.state = "active"
                           stop.disabled = false;
                           record.disabled = true;
                       }

                       else{
                           time = setInterval(timeFrame, 1000);
                           mediaRecorder.resume()
                       }

                    }
                    else{
                        mediaRecorder.pause();
                       clearInterval(time)
                        record_button.find("i").attr({
                            "class": "fa fa-circle",
                            "id": "record"
                        });
                        record_button.css("backgroundColor", " rgba(243, 87, 87, 0.446)")
                  }
                })

                stop.on("click", function() {
                    record_button.find("i").attr({
                        "class": "fa fa-circle",
                        "id": "record"
                    });
                    record_button.css("backgroundColor", " rgba(243, 87, 87, 0.446)");
                    mediaRecorder.stop();
                    stop.disabled = true;
                    record.disabled = false;
                });

                mediaRecorder.onstop = function() {
                    const clipName = prompt('Enter a name for your sound clip?','Recorded Clip');
                    const clipContainer = document.createElement('li');

                    let playContainer = document.createElement("span"),
                        playBtn = document.createElement("i"),
                        recordTitle = playContainer.cloneNode(false),
                        rename = playContainer.cloneNode(false);

                    let record_info = document.createElement("div"),
                        record_options = record_info.cloneNode(false);

                    const audio = document.createElement('audio');
                    const deleteButton = document.createElement('span');

                    clipContainer.classList.add('tr');
                    record_info.classList.add("text");
                    record_options.classList.add("sublist", "tr")
                    recordTitle.classList.add("recordTitle");
                    playContainer.classList.add("tr", "btn");
                    playBtn.classList.add("fa", "fa-play");

                    record_options.setAttribute("data-target", false);
                    audio.setAttribute('controls', '');
                    playBtn.setAttribute("id", "play")
                    deleteButton.textContent = 'Delete';
                    rename.textContent = "rename";
                    rename.setAttribute("data-action", "rename");
                    deleteButton.setAttribute("data-action", "delete");

                    if(clipName === null) {
                        recordTitle.textContent = 'Unnamed document';
                    } else {
                        recordTitle.textContent = clipName;
                    }
                    record_info.prepend(recordTitle);
                    record_info.append(record_options)
                    record_options.append(deleteButton, rename)
                    playContainer.appendChild(playBtn);
                    clipContainer.append(playContainer,record_info,audio);
                    body.find('[data-records]').append(clipContainer)

                    audio.controls = true;
                    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                    chunks = [];
                    audio.src = window.URL.createObjectURL(blob);
                    audio.onended = () =>{
                        playBtn.classList.add("fa", "fa-play")
                        playBtn.setAttribute("id", "play")
                    }

                    $(clipContainer).on("click", function () {
                        if ($(record_options).is("[data-target = 'true']")){
                            $(record_options).attr("data-target", false);
                        }else{ $(record_options).attr("data-target", true);}
                    });

                    $(playContainer).on("click", function (e) {
                        if (e.target.id === "play"){
                            audio.play()
                            $(playBtn).attr("class", "fa fa-pause");
                            playBtn.setAttribute("id", "Paused")
                        }
                        else{
                            audio.pause()
                            playBtn.classList.add("fa", "fa-play")
                            playBtn.setAttribute("id", "play")
                        }

                    });

                    $(deleteButton).on("click", function () {
                              let warning = confirm("This File Will no longer appear in the list")

                              if (warning === true){
                                  $(this).parents("li").remove();
                              }
                          });
                    rename.onclick = function() {
                        const existingName = recordTitle.textContent;
                        const newClipName = prompt('Enter a new name for your sound clip?');
                        if(newClipName === null) {
                            recordTitle.textContent = existingName;
                        } else {
                            recordTitle.textContent = newClipName;
                        }
                    }
                    clearInterval(time)
                    min.html("00"), hr.html("00"), sec.html("00")
                }

                mediaRecorder.ondataavailable = function(e) {
                    chunks.push(e.data);
                }
            }

            let onError = function(err) {
                let Msg = 'Error: ' + err + "Turn on Your recording device.";
                 Err(Msg)
               }
            navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

        } else {
            let msg = 'getUserMedia not supported on your browser!'
            Err(msg)
        }

      //record_listButton
      listButton.on("click", function (e) {
         e.stopPropagation();
         if (list_parent.hasClass("switch")){list_board.removeClass("switch")}
         else list_board.addClass("switch");
        });
    }


  $(document).on("click", function () {
      if($(window).innerWidth() <= 860){
          list_board.removeClass("switch");
      }

    });

    footer_section();
    theme();
    // aside()
});
