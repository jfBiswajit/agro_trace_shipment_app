var app = {
  initialize: function () {
    if (typeof window.cordova !== 'undefined') {
      document.addEventListener(
        'deviceready',
        function () {
          onDeviceReady(true);
        },
        false
      );
    } else {
      onDeviceReady(false);
    }
  },
};

function onDeviceReady() {
  const server = 'http://hbtobacco.inventory.aqualinkbd.com/api/';
  const driverRegBtn = document.querySelector('#driver_registration_btn');
  const loginForm = $('#login_form');

  const activeCurrentTab = function (tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName('tabcontent');

    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }

    tablinks = document.getElementsByClassName('tablinks');

    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    document.getElementById(tabName).style.display = 'block';
  };

  const setDefaultDateToToday = function () {
    Date.prototype.toDateInputValue = function () {
      var local = new Date(this);
      local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
      return local.toJSON().slice(0, 10);
    };

    $('.set_default_date').val(new Date().toDateInputValue());
  };

  const showBody = function () {
    document.querySelector('body').setAttribute('style', 'display: block');
  };

  const hideBody = function () {
    document.querySelector('body').setAttribute('style', 'display: none');
  };

  const initDatatable = function () {
    var table = $('.basic_datatable').DataTable();
    if (!table instanceof $.fn.dataTable.Api) {
      $('.basic_datatable').DataTable({
        aaSorting: [],
        lengthChange: false,
        responsive: true,
        language: {
          searchPlaceholder: 'Search...',
          sSearch: '',
          lengthMenu: '_MENU_ ',
        },
      });
    }
  };

  const initSelectize = function () {
    $('.selectize_me').SumoSelect({
      search: true,
      searchText: 'Enter here.',
      forceCustomRendering: true,
    });
  };

  const onBackKeyDown = function (e) {
    e.preventDefault();
    QRScanner.cancelScan();
    activeCurrentTab('tab_home');
  };

  const loginAction = function (e) {
    $.ajax({
      url: server + 'get_user_access',
      type: 'GET',
      data: $('#login_form').serialize(),

      error() {
        showAlert('Sorry!', "Can't connect to server.", 'error', 'tab_login');
      },

      success(response) {
        if (response.success) {
          let accessModules = response.data;
          window.localStorage.setItem('userId', $('#user_id').val());
          accessModules.forEach(function (module) {
            $(`#${module}`).show();
          });
          activeCurrentTab('tab_home');
        } else {
          swal('Unauthorized!', "Your credentials don't match.", 'error');
        }
      },
    });
  };
  
  const testCamera = function() {
    window.QRScanner.prepare(() => {
      hideBody();
      window.QRScanner.show(() => {
        window.QRScanner.scan((err, text) => {
          showBody();
          if (text) {
            alert(text);
          }else {
            alert('Cancled');
          }
        });
      });
    });
  }

  const initEvents = function () {
    loginForm.submit(function (e) {
      e.preventDefault();
      loginAction(e);
    });

    driverRegBtn.addEventListener('click', function (e) {
      activeCurrentTab('tab_driver_registation');
    });

    $(document.body).on('click', '#home_btn', function (e) {
      activeCurrentTab('tab_home');
    });
    
    document.addEventListener('backbutton', onBackKeyDown, false);

    activeCurrentTab('tab_driver_registation');
    initSelectize();
  };

  initEvents();
}

app.initialize();
