import {Link} from "react-router-dom"
type propTypes = {
    text: string, 
    goto: string
}
function FormFooter({text, goto}: propTypes) {
  return (
    <div className="form-footer">
        <p>
            {text}
            <Link to={"/"+goto}>{goto}</Link>
        </p>
    </div>
  )
}

export default FormFooter