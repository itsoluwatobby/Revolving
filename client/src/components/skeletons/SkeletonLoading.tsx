import './Skeleton.css';

type Props = {
  classes: string
}

const SkeletonLoading = ({ classes }: Props) => {
  const classNames = `skeleton ${classes} animate-pulse`;
  
  return (
    <div className={classNames} />
  )
}

export default SkeletonLoading
