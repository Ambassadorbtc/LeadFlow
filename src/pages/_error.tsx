import Error from "next/error";

interface ErrorProps {
  statusCode: number;
  title?: string;
}

function CustomError({ statusCode, title }: ErrorProps) {
  return (
    <Error
      statusCode={statusCode}
      title={title || `An error ${statusCode} occurred on server`}
    />
  );
}

CustomError.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
