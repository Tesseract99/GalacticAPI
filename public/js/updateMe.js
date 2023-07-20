import { showAlert } from "./alerts.js";
const updateMe = async ({ name, email }) => {
  try {
    const { data } = await axios.patch(
      "http://localhost:5000/api/v1/users/updateMe",
      {
        name,
        email,
      }
    );

    if (data.status === "success") {
      showAlert(
        "success",
        "Personal Details Updated Successfully!.Redirecting."
      );
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
    console.log(error);
  }
};

document
  .querySelector(".form-user-data .btn--save-settings")
  .addEventListener("click", (event) => {
    event.preventDefault();
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    updateMe({ name, email });
  });
