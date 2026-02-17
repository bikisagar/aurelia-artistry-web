import content from '@/data/content.json';

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{content.notFound.code}</h1>
        <p className="mb-4 text-xl text-gray-600">{content.notFound.message}</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          {content.notFound.link}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
