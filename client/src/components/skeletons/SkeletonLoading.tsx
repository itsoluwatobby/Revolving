import './Skeleton.css';

type Props = {
  classes: string
}

const SkeletonLoading = ({ classes }: Props) => {
  const classNames = `skeleton ${classes} animate-pulse`;
  
  return (
    <div className={classNames}></div>
  )
}

export default SkeletonLoading
