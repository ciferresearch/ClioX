"use client";

import { useState } from 'react';
import Button from '@/components/common/Button';
import Container from '@/components/layout/Container';

type Role = {
  icon: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
};

const roles: Role[] = [
  {
    icon: '🔍',
    title: "I'm a Researcher",
    description: 'Explore archival datasets to gain data-driven insights.',
    primaryAction: 'Sign Up',
    secondaryAction: 'Browse Catalogue'
  },
  {
    icon: '📚',
    title: "I'm an Archivist/Cultural Institution",
    description: 'Publish and protect your holdings with tools built for ethical stewardship and collaboration.',
    primaryAction: 'Sign Up',
    secondaryAction: 'Publish Dataset'
  },
  {
    icon: '🏛️',
    title: 'Become an Ecosystem Partner',
    description: 'Ready to join a global values-aligned community?',
    primaryAction: 'Become a Partner',
    secondaryAction: 'Learn More'
  }
];

export default function ChooseRole() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  const handleRoleClick = (index: number) => {
    setSelectedRole(selectedRole === index ? null : index);
  };

  return (
    <section id="choose-role" className="pt-24 bg-white">
      <Container>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Choose Your Role</h2>
          <p className="text-gray-600 text-xl mb-16">
            Select the path that best describes you to see your next steps.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div key={index} className="flex flex-col">
                <div
                  className={`rounded-2xl p-8 flex flex-col items-center text-center bg-white 
                    cursor-pointer hover:shadow-md h-[320px]
                    ${
                      selectedRole === index
                        ? "shadow-md ring-2 ring-blue-600"
                        : "shadow-sm"
                    }
                    transition-all duration-300`}
                  onClick={() => handleRoleClick(index)}
                >
                  <div className="h-[120px] flex flex-col items-center">
                    <div className="text-4xl mb-6">{role.icon}</div>
                    <h3 className="text-2xl font-bold">{role.title}</h3>
                  </div>

                  <div className="flex items-center flex-1">
                    <p className="text-gray-600">{role.description}</p>
                  </div>
                </div>

                <div className="h-[140px] mt-4">
                  <div 
                    className={`space-y-4 transition-all duration-300 ease-out
                      ${selectedRole === index 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95'
                      }`}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer transform transition-all duration-200"
                    >
                      {role.primaryAction}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full text-blue-600 bg-transparent hover:bg-gray-50 cursor-pointer transform transition-all duration-200"
                    >
                      {role.secondaryAction}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
} 