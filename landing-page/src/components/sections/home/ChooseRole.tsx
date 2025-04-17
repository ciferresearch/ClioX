"use client";

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/common/Button';
import Container from '@/components/layout/Container';
import { BodyText, DisplayLarge, DisplayMedium } from '@/components/common/Typography';

type Role = {
  imageSrc: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
};

const roles: Role[] = [
  {
    imageSrc: '/images/researcher-icon.svg',
    title: "Researcher",
    description: 'Explore archival datasets with AI to gain data-driven insights.',
    primaryAction: 'Sign Up',
    secondaryAction: 'Browse Catalogue'
  },
  {
    imageSrc: '/images/archivist-icon.svg',
    title: "Archivist/Cultural Institution",
    description: 'Publish and protect your holdings with tools built for ethical AI stewardship and collaboration.',
    primaryAction: 'Sign Up',
    secondaryAction: 'Publish Dataset'
  },
  {
    imageSrc: '/images/partner-icon.svg',
    title: 'Ecosystem Partner',
    description: 'Ready to join a global values-aligned Web3 community?',
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
      <Container className="px-4">
        <div className="w-full mx-auto text-center">
          <DisplayLarge align="center" className="mb-10">Choose Your Role</DisplayLarge>
          <div className="mb-16">
            <BodyText align="center">
              Select the path that best describes you to see your next steps.
            </BodyText>
          </div>

          <div className="flex justify-between w-full">
            {roles.map((role, index) => (
              <div key={index} className="flex flex-col h-[700px] w-[360px] relative">
                <div
                  className={`flex flex-col items-center text-center h-[550px] w-full
                    cursor-pointer transition-all duration-300 pb-8
                    ${
                      selectedRole === index
                        ? "ring-2 ring-blue-600 rounded-2xl"
                        : ""
                    }`}
                  onClick={() => handleRoleClick(index)}
                >
                  <div className="flex flex-col h-full items-center">
                    <div className="h-[260px] flex items-center justify-center">
                      <div className="relative w-[180px] h-[180px]">
                        <Image 
                          src={role.imageSrc} 
                          alt={`${role.title} icon`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="h-[100px] flex items-center justify-center">
                      <DisplayMedium>{role.title}</DisplayMedium>
                    </div>
                    
                    <div className="h-[180px] flex items-start justify-center pt-4 pb-6">
                      <BodyText align="center" className="mx-auto px-6 max-w-[320px] text-gray-600">
                        {role.description}
                      </BodyText>
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-[360px] mx-auto">
                  <div 
                    className={`space-y-4 transition-all duration-300 ease-out flex flex-col items-center
                      ${selectedRole === index 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95'
                      }`}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-[280px] bg-blue-600 hover:bg-blue-700 cursor-pointer transform transition-all duration-200"
                    >
                      {role.primaryAction}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-[280px] text-blue-600 bg-transparent hover:bg-gray-50 cursor-pointer transform transition-all duration-200"
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