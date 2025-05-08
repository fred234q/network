document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#new-post-form').addEventListener('submit', event => new_post(event));
});

function new_post(event) {

    // Prevent reloading the page
    event.preventDefault();

    // Retrieve contents of post
    const body = document.querySelector('#new-post-body').value;

    // Post post to API
    fetch('/new-post', {
        method: 'POST',
        body: JSON.stringify({
            body: body
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);

        // Remove existing alert
        if (document.querySelector('.alert')) {
            document.querySelector('.alert').remove();
        }

        // Create alert
        const alert = document.createElement('div');
        alert.classList.add('alert', 'nm');
        document.querySelector('#new-post').append(alert);

        // Change color and content based on the type of alert
        if (result.error) {
            alert.classList.add('alert-danger');
            alert.innerText = `Error: ${result.error}`;
        } else {
            alert.classList.add('alert-success');
            alert.innerText = result.message;
        }

        // Clear textarea
        document.querySelector('#new-post-body').value = '';

    })
    .catch(error => {
        console.log('Error: ', error);
    });
}