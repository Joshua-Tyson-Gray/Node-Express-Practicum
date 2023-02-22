/*
- DONE: Strip out your Axios code. Use Axios instead.
- DONE: Write and use your own lite version of jQuery.
*/

class jq {
  constructor(arg) {
    if (arguments.length === 0) {
      this.els = [];
    } else if (arguments.length === 1) {
      try {
        this.els = [...document.querySelectorAll(arg)];
        return;
      } catch (err) {}
      try {
        this.els = [document.createElement(arg.substring(1, arg.length - 1))];
        return;
      } catch (err) {}
    }
  }
  css(propName, value) {
    this.els.forEach((el) => (el.style[propName] = value));
  }
  show() {
    this.els.forEach((el) => (el.hidden = false));
  }
  hide() {
    this.els.forEach((el) => (el.hidden = true));
  }
  on(evType, func) {
    this.els.forEach((el) => el.addEventListener(evType, func));
  }
  attr(at, val) {
    this.els.forEach((el) => (el[at] = val));
  }
  removeAttr(attr) {
    this.els.forEach((el) => el.removeAttribute(attr));
  }
  prop(prop, val) {
    this.els.forEach((el) => (el[prop] = val));
  }
  val() {
    if (arguments.length > 0) {
      this.els.forEach((el) => (el.value = arguments[0]));
    } else {
      return this.els[0].value || '';
    }
  }
  html(a) {
    if (arguments.length > 0) {
      this.els.forEach((el) => (el.innerHTML = arguments[0]));
    }
  }
  append(child) {
    if (child.constructor && child.constructor.name === 'jq') {
      for (let el of this.els) {
        el.innerHTML += child.els[0].outerHTML;
      }
    } else {
      this.els.forEach((el) => el.appendChild(child));
    }
  }
  addClass(c) {
    this.els.forEach((el) => (el.className += ' ' + c));
  }
  removeClass(c) {
    for (let cla of c.split(' ')) {
      this.els.forEach((el) => el.classList.remove(cla));
    }
  }
  filter(sel) {
    let newNode = new jq();
    newNode.els[0] = this.els[0].querySelector(sel);
    return newNode;
  }
  toggle() {
    this.els.forEach((el) => (el.hidden = !el.hidden));
  }
}
let $ = (sel) => new jq(sel);

(async function () {
  // Hide UVU Id input
  $('#uvuIdWrapper, #logWrapper').hide();
  $('#newLogText').removeAttr('style');
  toggleSubmitBtn(false);

  // Write `10234567` as sample data on the [uvuid input field]
  let $uvuIdInput = $('#uvuId');
  $uvuIdInput.attr('placeholder', '10234567');

  // UVUid input validation
  $uvuIdInput.on('keydown', (event) => {
    // Only allow numbers
    let $uvuIdVal = $('#uvuId').val();
    if (event.key && event.key.length === 1 && isNaN(event.key)) {
      // Prevent any printable characters that are not numbers from being printed.
      event.preventDefault();
    } else if (
      event.key &&
      event.key.length === 1 &&
      $uvuIdVal.length === 8 &&
      !window.getSelection().toString()
    ) {
      // Prevent any numbers from being printed if the current input length is 8 and no text is highlighted.
      event.preventDefault();
    }
  });

  // If the UVUid is updated, attempt to rerender the logs
  $uvuIdInput.on('input', (event) => {
    updateLogRender();
  });

  // Add event to enable/disable submit button if there is text in the new log text area or not
  $('#newLogText').on('input', (event) => {
    toggleSubmitBtn(event.currentTarget.value);
  });

  // Add event listener to course drop down. If no value is selected, uvuidWrapper is hidden. Once a value is selected, the wrapper is displayed.
  $('#course').on('change', (event) => {
    updateLogRender();
    let curValue = event.currentTarget.value;
    let $idWrapper = $('#uvuIdWrapper');
    if (curValue === '') {
      $idWrapper.removeClass('flex flex-row');
      $('#logWrapper').hide();
      $('#uvuId').val('');
      clearLogs();
    } else {
      $idWrapper.addClass('flex flex-row');
    }
  });

  // Add event listener to submit button.
  $('#addLogForm button[type="submit"]').on('click', (event) => {
    event.preventDefault();
    let log = $('#newLogText').val();
    let id = $('#uvuId').val();
    let course = $('#course').val();
    let date = new Date().toLocaleString();
    axios({
      method: 'post',
      url: 'http://localhost:3000/logs',
      data: {
        courseId: course,
        uvuId: id,
        text: log,
        date: date,
        id: generateId(),
      },
    });
    updateLogRender();
    $('#newLogText').val('');
    toggleSubmitBtn(false);
  });

  // Render Course Drop Down
  renderCourseDropDown();
})();

function generateId() {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (i = 0; i < 7; ++i) {
    let index = Math.floor(Math.random() * 52);
    id += chars.charAt(index);
  }
  return id;
}

function clearLogs() {
  // Clear all components of the form and reset the title
  $('#uvuIdDisplay').html('Student Logs');
  $('logWrapper ul').html('');
  $('#newLogText').val('');
  toggleSubmitBtn(false);
}

function updateLogRender() {
  // Rerender the logs if a course is selected and a valid uvu id are entered
  let course = $('#course').val();
  let id = $('#uvuId').val();
  if (id.length === 8 && course) {
    $('#logWrapper').show();
    renderLogs(id, course);
  } else {
    $('#logWrapper').hide();
    clearLogs();
  }
}

async function renderLogs(id, course) {
  // Set page title to include uvuId
  $('#uvuIdDisplay').html('Student Logs for ' + id);
  // Clear current logs
  $('#logWrapper ul').html('');

  // Render Logs
  try {
    let logs = await retrieveLogs(id, course);
    for (let log of logs) {
      let logTemplate = getLogTemplate();
      logTemplate.filter('small').html(log.date);
      logTemplate.filter('p').html(log.text);
      $('#logWrapper ul').append(logTemplate);
      // Add EventListener to each individual log to toggle visibility
      $('#logWrapper ul li').on('click', (event) => {
        // Should this be jquerylite in any way?
        let isHidden = event.currentTarget.querySelector('pre').hidden;
        event.currentTarget.querySelector('pre').hidden = !isHidden;
      });
    }
  } catch (error) {
    // If an HTTP error occures, display the error in the logWrapper container. This will be cleared next time the logs render.
    let $errorMsg = $('<li>');
    $errorMsg.html(error);
    $('#logWrapper ul').append($errorMsg);
  }
}

function toggleSubmitBtn(isEnabled) {
  // Toggles the submit button to enabled if true is passed. Otherwise it is disabled.
  let $submitBtn = $('#addLogForm button[type="submit"]');
  if (isEnabled) {
    $submitBtn.prop('disabled', false);
  } else {
    $submitBtn.prop('disabled', true);
  }
}

function getLogTemplate() {
  /* Generates and returns HTML of the following format:
  <li>
    <div><small></small></div>
    <pre><p></p></pre>
  </li>
  */

  // Create elements
  let $small = $('<small>');
  let $div = $('<div>');
  let $p = $('<p>');
  let $pre = $('<pre>');
  let $li = $('<li>');

  $p.addClass('whitespace-normal');
  $small.addClass('tracking-widest');
  $pre.hide();
  $pre.append($p);
  $pre.addClass('font-sans');
  $pre.addClass('tracking-wider text-lg pt-2');
  $div.append($small);
  $div.addClass('pb-0');
  $li.append($div);
  $li.append($pre);
  $li.addClass('border-b-2 py-4 hover:cursor-pointer');

  return $li;
}

async function renderCourseDropDown() {
  // Generate Course drop down select
  let $courseSelect = $('#course');

  // Generate default "Choose Course" option for drop down select
  let $courseSelMes = $('<option>');
  $courseSelMes.val('');
  $courseSelMes.prop('selected', 'true');
  $courseSelMes.html('Choose Courses');
  $courseSelect.append($courseSelMes);

  // Retrieve courses and generate course option tags and append to drop down select
  let courses = await retrieveCourses();
  for (let course of courses) {
    let $courseOption = $('<option>');
    $courseOption.val(course.id);
    $courseOption.html(course.display);
    $courseSelect.append($courseOption);
  }
}

async function retrieveLogs(id, course) {
  // Use Axios to retrieve logs from server for the corresponding student and course
  let srvDataLogs = await axios(
    'http://localhost:3000/logs?courseId=' +
      course +
      '&uvuId=' +
      id
  );

  // if 200 or 304, display results, else appropriately guide the user
  if (srvDataLogs.status != 200 && srvDataLogs.status != 304) {
    // Throw an error passing an appropriate message based on the error code
    if (srvDataLogs.status >= 400 && srvDataLogs.status < 500) {
      throw new Error(
        'HTTP Error Code: ' + srvDataLogs.status + ' Bad request'
      );
    } else if (srvDataLogs.status >= 500 && srvDataLogs.status < 600) {
      throw new Error(
        'HTTP Error Code: ' +
          srvDataLogs.status +
          ' Server error. Please try again later.'
      );
    } else {
      throw new Error('HTTP Error Code: ' + srvDataLogs.status);
    }
  }

  // Obtain and return logs in json format
  let logs = await srvDataLogs.data;
  return logs;
}

async function retrieveCourses() {
  // Use Axios to retrieve courses from server
  let srvDataCourses = await axios(
    'http://localhost:3000/api/v1/courses'
  );
  // Obtain and return courses in json format
  let courses = await srvDataCourses.data;
  return courses;
}
