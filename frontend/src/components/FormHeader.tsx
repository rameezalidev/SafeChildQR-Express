import './FormHeader.css'

type headingProps = {
    title: string,
    text: string,
    heading: string,
    detail: string
}

function FormHeader(props: headingProps) {
  return (
    <div className="form-header">
        <h1>{props.title}<span>{props.text}</span></h1>
        <h1>{props.heading}</h1>
        <p>{props.detail}</p>
    </div>
  )
}

export default FormHeader