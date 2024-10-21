// Global AJAX function with separate success and error callbacks
function makeAjaxRequest(url, method, data = {}, successCallback, errorCallback) {
  $.ajax({
    url: url,
    type: method,
    dataType: "json",
    data: data,
    success: function (response) {
      if (typeof successCallback === "function") {
        successCallback(response);
      } else {
        console.error("Success callback is not a function");
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX error:", xhr, status, error);
      if (typeof errorCallback === "function") {
        errorCallback(xhr, status, error);
      }
    }
  });
}
// Search Functionality
$("#searchInp").on("keyup", function () {
  const searchTerm = this.value.toLowerCase();

  // Determine which button is active and set the URL and render 
  let url, renderFunction;

  if ($("#personnelBtn").hasClass("active")) {
    url = "libs/php/searchPersonnel.php";
    renderFunction = renderPersonnelData;
  } else if ($("#departmentsBtn").hasClass("active")) {
    url = "libs/php/searchDepartment.php";
    renderFunction = renderDepartmentData;
  } else if ($("#locationsBtn").hasClass("active")) {
    url = "libs/php/searchLocation.php";
    renderFunction = renderLocationData;
  } else {
    return; // 
  }

  // Make the AJAX request
  makeAjaxRequest(
    url,
    "POST",
    { txt: searchTerm },
    function (result) {
      if (result.status.code === "200") {
        renderFunction(result.data.found);
      } else {
        console.error("Error fetching data:", result.status.description);
        renderFunction([]);
      }
    },
    function (xhr, status, error) {
      console.error("Error during search:", error);
      renderFunction([]);
    }
  );
});



$("#filterBtn").click(function () {

  // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location

});

$("#addBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    $("#addPersonnelModal").modal("show");
    populateDepartments("#addPersonnelDepartment");
  } else if ($("#departmentsBtn").hasClass("active")) {
    $("#addDepartmentModal").modal("show");
    populateLocations("#addDepartmentLocation");
  } else if ($("#locationsBtn").hasClass("active")) {
    $("#addLocationModal").modal("show");
  }
});
$(".nav-button").click(function () {
  $(".nav-button").removeClass("active");
  $(this).addClass("active");
});

$(document).ready(function () {
  $("#personnelBtn").click(function () {
    fetchPersonnelData();
  });
  $("#departmentsBtn").click(function () {
    fetchDepartmentData();
  });
  $("#locationsBtn").click(function () {
    fetchLocationData();
  });
  fetchPersonnelData();
});

// Function to fetch personnel data
const fetchPersonnelData = () => {
  makeAjaxRequest(
    "libs/php/getAll.php",
    "POST",
    {},
    function (response) {
      const statusCode = response.status.code;
      if (statusCode === "200") {
        renderPersonnelData(response.data);
      } else {
        console.error("Error fetching data: ", response.status.message);
      }
    },
    function (xhr, status, error) {
      console.error("Error fetching personnel data:", error);
    }
  );
};

// Function to render personnel data in the table
const renderPersonnelData = (data) => {
  const personnelTableBody = $("#personnelTableBody");
  personnelTableBody.empty();

  // Check if data is an array
  if (Array.isArray(data)) {
    $.each(data, function (index, personnel) {
      personnelTableBody.append(`
        <tr>
          <td class="align-middle text-nowrap">${personnel.firstName}, ${personnel.lastName}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${personnel.department}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${personnel.location}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${personnel.email}</td>
          <td class="text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${personnel.id}">
                  <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${personnel.id}">
                  <i class="fa-solid fa-trash fa-fw"></i>
              </button>
          </td>
        </tr>
      `);
    });
  } else {
    console.error("Invalid data format received:", data);
  }
};

// Function to render department data in the table
const renderDepartmentData = (data) => {
  const departmentTableBody = $("#departmentTableBody");
  departmentTableBody.empty();

  // Check if data is an array
  if (Array.isArray(data)) {
    $.each(data, function (index, department) {
      departmentTableBody.append(`
        <tr>
          <td class="align-middle text-nowrap">${department.name}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${department.location}</td>
          <td class="text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                  <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${department.id}">
                  <i class="fa-solid fa-trash fa-fw"></i>
              </button>
          </td>
        </tr>
      `);
    });
  } else {
    console.error("Invalid data format received:", data);
  }
};

// Function to render location data in the table
const renderLocationData = (data) => {
  const locationTableBody = $("#locationTableBody");
  locationTableBody.empty();

  // Check if data is an array
  if (Array.isArray(data)) {
    $.each(data, function (index, location) {
      locationTableBody.append(`
        <tr>
          <td class="align-middle text-nowrap">${location.name}</td>
          <td class="text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-id="${location.id}" data-bs-target="#editLocationModal">
                  <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-id="${location.id}" data-bs-target="#deleteLocationModal">
                  <i class="fa-solid fa-trash fa-fw"></i>
              </button>
          </td>
        </tr>
      `);
    });
  } else {
    console.error("Invalid data format received:", data);
  }
};

// Function to fetch department data
const fetchDepartmentData = () => {
  makeAjaxRequest(
    "libs/php/getAllDepartments.php",
    "POST",
    {},
    function (response) {
      const statusCode = response.status.code;
      if (statusCode === "200") {
        renderDepartmentData(response.data);
      } else {
        console.error("Error fetching departments:", response.status.description);
      }
    },
    function (xhr, status, error) {
      console.error("Error fetching departments:", error);
    }
  );
};

// Function to fetch location data
const fetchLocationData = () => {
  makeAjaxRequest(
    "libs/php/getAllLocations.php",
    "POST",
    {},
    function (response) {
      const statusCode = response.status.code;
      if (statusCode === "200") {
        renderLocationData(response.data);
      } else {
        console.error("Error fetching locations:", response.status.description);
      }
    },
    function (xhr, status, error) {
      console.error("Error fetching locations:", error);
    }
  );
};
// Refresh button functionality
$("#refreshBtn").click(function () {

  if ($("#personnelBtn").hasClass("active")) {
    fetchPersonnelData();
  } else if ($("#departmentsBtn").hasClass("active")) {
    fetchDepartmentData();
  } else if ($("#locationsBtn").hasClass("active")) {
    fetchLocationData();
  }

});
function populateDepartments(selectId) {
  makeAjaxRequest("libs/php/getAllDepartments.php", "POST", {}, function (response) {
    const departments = response.data;
    const departmentSelect = $(selectId);
    departmentSelect.empty(); 
    $.each(departments, function (index, department) {
      departmentSelect.append($("<option>", { value: department.id, text: department.name }));
    });
  });
}

function populateLocations(selectId) {
  makeAjaxRequest("libs/php/getAllLocations.php", "POST", {}, function (response) {
    const locations = response.data;
    const locationSelect = $(selectId);
    locationSelect.empty(); 
    $.each(locations, function (index, location) {
      locationSelect.append($("<option>", { value: location.id, text: location.name }));
    });
  });
}


// add personnel modal 
$("#addPersonnelModal").on("show.bs.modal", function (e) {
  $("#addPersonnelForm")[0].reset();
  populateDepartments("#addPersonnelDepartment");
});

$("#addPersonnelForm").on("submit", function (e) {
  e.preventDefault();

  const newPersonnelData = {
    firstName: $("#addPersonnelFirstName").val(),
    lastName: $("#addPersonnelLastName").val(),
    jobTitle: $("#addPersonnelJobTitle").val(),
    email: $("#addPersonnelEmailAddress").val(),
    departmentID: $("#addPersonnelDepartment").val(),
  };

  makeAjaxRequest(
    "libs/php/insertPersonnel.php",
    "POST",
    newPersonnelData,
    function (response) {
      if (response.status && response.status === "success") {

        $("#addPersonnelModal").modal("hide");


        fetchPersonnelData();
      } else {
        console.error("Error adding personnel:", response.message || "Unknown error");
      }
    },
    function (xhr, status, error) {
      console.error("Error adding personnel:", status, error);
      console.log("Response:", xhr.responseText);
    }
  );
});


// delete personnel modal 
$("#deletePersonnelModal").on("show.bs.modal", function (e) {
  const personnelId = $(e.relatedTarget).attr("data-id");
  console.log("Deleting personnel with ID:", personnelId);
  $("#deletePersonnelID").val(personnelId);
});


$("#deletePersonnelForm").on("submit", function (e) {
  e.preventDefault();
  const personnelId = $("#deletePersonnelID").val();
  makeAjaxRequest(
    "libs/php/deletePersonnel.php",
    "POST",
    { id: personnelId },
    function (response) {
      if (response.status && response.status === "success") {
        $("#deletePersonnelModal").modal("hide");
        fetchPersonnelData();
      } else {
        console.error("Error deleting personnel:", response.message || "Unknown error");
      }
    },
    function (xhr, status, error) {
      console.error("Error deleting personnel:", status, error);
      console.log("Response:", xhr.responseText);
    }
  );
});



// When the edit modal is opened, populate the fields with personnel data
$("#editPersonnelModal").on("show.bs.modal", function (e) {
  const personnelId = $(e.relatedTarget).attr("data-id");
  console.log("Editing personnel with ID:", personnelId);

  makeAjaxRequest(
    "libs/php/getPersonnelByID.php",
    "POST",
    { id: personnelId },
    function (response) {
      console.log("Server Response:", response);

      if (response.status.code === "200") {
        const personnel = response.data.personnel[0];
        const departments = response.data.department;

        $("#editPersonnelEmployeeID").val(personnel.id);
        $("#editPersonnelFirstName").val(personnel.firstName);
        $("#editPersonnelLastName").val(personnel.lastName);
        $("#editPersonnelJobTitle").val(personnel.jobTitle);
        $("#editPersonnelEmailAddress").val(personnel.email);

        // Populate the department dropdown
        $("#editPersonnelDepartment").html("");
        $.each(departments, function (index, department) {
          $("#editPersonnelDepartment").append(
            $("<option>", { value: department.id, text: department.name })
          );
        });

        // Set the selected department
        $("#editPersonnelDepartment").val(personnel.departmentID);
      } else {
        console.error("Error fetching personnel data:", response.status.message);
      }
    },
    function (xhr, status, error) {
      console.error("Error fetching personnel data:", status, error);
    }
  );
});

// Handles the personnel update form submission
$("#editPersonnelForm").on("submit", function (e) {
  e.preventDefault();

  const personnelData = {
    id: $("#editPersonnelEmployeeID").val(),
    firstName: $("#editPersonnelFirstName").val(),
    lastName: $("#editPersonnelLastName").val(),
    jobTitle: $("#editPersonnelJobTitle").val(),
    email: $("#editPersonnelEmailAddress").val(),
    departmentID: $("#editPersonnelDepartment").val()
  };

  makeAjaxRequest(
    "libs/php/updatePersonnel.php",
    "POST",
    personnelData,
    function (response) {
      console.log("Server Response:", response);

      if (response.status && response.status === "success") {
        // Close the modal
        $("#editPersonnelModal").modal("hide");

        fetchPersonnelData();
      } else {
        console.error("Error updating personnel data:", response.message || "error");
      }
    },
    function (xhr, status, error) {
      console.error("AJAX Error - Status:", status);
      console.error("AJAX Error - Error:", error);
      console.error("AJAX Error - Response:", xhr.responseText);
    }
  );
});
