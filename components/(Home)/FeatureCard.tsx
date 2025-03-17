// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FeatureCard = ({ icon, title, description }: any) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
