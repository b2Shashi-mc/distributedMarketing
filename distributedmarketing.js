document.getElementById('data-extension-form').addEventListener('submit',consentSubmit);
function consentSubmit(e){
  try{
    e.preventDefault();
    var formData=new FormData(document.getElementById('data-extension-form'));
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'coderesourceDistributedmarketing.js', true);
    xhr.onload = () => {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
          // Check against the numeric status code
          console.log(xhr.response);
          console.log(xhr.responseText);
          // Reset the form fields after successful submission
          document.getElementById('data-extension-form').reset();
          document.getElementById('success-message').style.display = 'block';
          // Hide the success message after 3 seconds (3000 milliseconds)
          setTimeout(hideSuccessMessage, 3000);
        }
      }
    };
    xhr.onerror = function(){
      console.log("** An error occurred during the submission");
    }
    xhr.send(formData);
  }
  catch(ex)
  {
    alert(ex.message);
  }
}
function hideSuccessMessage() {
  document.getElementById('success-message').style.display = 'none';
}